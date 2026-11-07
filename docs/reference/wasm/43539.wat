  (func (;43539;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366816
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3388632
      call 2180
      i32.const 3388636
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366816
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=32
    local.tee 1
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      loop  ;; label = @2
        local.get 1
        local.get 3
        local.get 2
        i32.const 12
        i32.add
        i32.const 3388636
        i32.load
        call 50458
        local.get 2
        i32.load offset=12
        local.set 1
        i32.const 3360788
        i32.load
        local.tee 5
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 5
          call 60460
        end
        block  ;; label = @3
          local.get 1
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 1
          i32.load8_u offset=84
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          i32.load8_u offset=85
          i32.eqz
          br_if 0 (;@3;)
          local.get 4
          local.get 1
          i32.load8_u offset=52
          i32.const 1
          i32.xor
          i32.add
          local.set 4
        end
        local.get 3
        i32.const 1
        i32.add
        local.tee 3
        local.get 0
        i32.load offset=32
        local.tee 1
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 4)
