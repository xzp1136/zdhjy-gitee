  (func (;44431;) (type 3) (param i32 i32 i32) (result i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4367442
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367442
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store offset=4
    i32.const 3375560
    i32.load
    local.set 4
    local.get 0
    i32.load offset=48
    local.set 0
    local.get 2
    local.get 1
    i32.store offset=8
    block  ;; label = @1
      local.get 0
      local.get 2
      i32.const 8
      i32.add
      local.get 2
      i32.const 4
      i32.add
      local.get 4
      call 34286
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      i32.load offset=4
      local.tee 1
      i32.load offset=12
      local.tee 4
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 0
      loop  ;; label = @2
        local.get 1
        local.get 0
        local.get 4
        i32.rem_s
        local.get 2
        i32.const 12
        i32.add
        i32.const 3387116
        i32.load
        call 50458
        local.get 2
        i32.load offset=12
        local.set 3
        i32.const 3360788
        i32.load
        local.tee 1
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 1
          call 60460
        end
        block  ;; label = @3
          local.get 3
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 3
          i32.load8_u offset=96
          br_if 0 (;@3;)
          local.get 3
          i32.load8_u offset=108
          br_if 0 (;@3;)
          i32.const 0
          call 49305
          local.get 3
          f32.load offset=112
          f32.ge
          br_if 2 (;@1;)
        end
        local.get 0
        i32.const 1
        i32.add
        local.tee 0
        local.get 2
        i32.load offset=4
        local.tee 1
        i32.load offset=12
        local.tee 4
        i32.lt_s
        br_if 0 (;@2;)
      end
      i32.const 0
      local.set 3
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 3)
