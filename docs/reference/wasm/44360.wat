  (func (;44360;) (type 2) (param i32 i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4367387
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3386588
      call 2180
      i32.const 3386592
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367387
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=40
    local.tee 2
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      loop  ;; label = @2
        local.get 2
        local.get 5
        local.get 3
        i32.const 12
        i32.add
        i32.const 3386592
        i32.load
        call 50458
        local.get 3
        i32.load offset=12
        local.set 2
        i32.const 3360788
        i32.load
        local.tee 4
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 4
          call 60460
        end
        block  ;; label = @3
          local.get 2
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 0
          i32.load offset=44
          local.set 4
          i32.const 3360788
          i32.load
          local.tee 6
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 6
            call 60460
          end
          local.get 2
          local.get 4
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 2
          local.get 1
          i32.const 0
          call 48707
        end
        local.get 5
        i32.const 1
        i32.add
        local.tee 5
        local.get 0
        i32.load offset=40
        local.tee 2
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
