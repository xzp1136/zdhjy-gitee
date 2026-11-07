  (func (;43416;) (type 12) (param i32 i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 7
    global.set 0
    i32.const 0
    local.set 5
    i32.const 4366729
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3388528
      call 2180
      i32.const 3388532
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366729
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store
    local.get 3
    i32.const 0
    i32.store
    local.get 4
    i32.const -1
    i32.store
    block  ;; label = @1
      local.get 0
      i32.load offset=16
      local.tee 6
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 6
        local.get 5
        local.get 7
        i32.const 12
        i32.add
        i32.const 3388532
        i32.load
        call 50458
        local.get 7
        i32.load offset=12
        local.set 6
        i32.const 3360788
        i32.load
        local.tee 8
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 8
          call 60460
        end
        block  ;; label = @3
          local.get 6
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 6
          i32.load8_u offset=129
          br_if 0 (;@3;)
          local.get 6
          local.get 1
          local.get 3
          local.get 4
          local.get 5
          call 43417
          i32.eqz
          br_if 0 (;@3;)
          local.get 2
          local.get 6
          i32.store
          i32.const 1
          local.set 5
          br 2 (;@1;)
        end
        local.get 5
        i32.const 1
        i32.add
        local.tee 5
        local.get 0
        i32.load offset=16
        local.tee 6
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
      i32.const 0
      local.set 5
    end
    local.get 7
    i32.const 16
    i32.add
    global.set 0
    local.get 5)
