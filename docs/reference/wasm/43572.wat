  (func (;43572;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 0
    local.set 1
    i32.const 4366837
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3365220
      call 2180
      i32.const 3482560
      call 2180
      i32.const 4366837
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load offset=8
            br_table 0 (;@4;) 1 (;@3;) 2 (;@2;) 3 (;@1;)
          end
          local.get 0
          i32.const -1
          i32.store offset=8
          local.get 0
          i32.load offset=16
          local.set 3
          i32.const 3360788
          i32.load
          local.tee 4
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 4
            call 60460
          end
          local.get 3
          i32.const 0
          i32.const 0
          call 48872
          br_if 2 (;@1;)
          local.get 2
          local.get 0
          i32.load offset=20
          i32.store offset=12
          i32.const 3359088
          i32.load
          local.get 2
          i32.const 12
          i32.add
          call 2193
          local.set 1
          i32.const 3482560
          i32.load
          local.get 1
          i32.const 0
          call 48011
          local.set 1
          i32.const 3356428
          i32.load
          local.tee 3
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 3
            call 60460
          end
          local.get 1
          i32.const 0
          call 55817
          local.get 0
          i64.const 1
          i64.store offset=8 align=4
          i32.const 1
          local.set 1
          br 2 (;@1;)
        end
        local.get 0
        i32.const -1
        i32.store offset=8
        i32.const 3365220
        i32.load
        call 1900
        local.tee 1
        f32.const 0x1.eb851ep-4 (;=0.12;)
        i32.const 0
        call 2408
        local.get 0
        i32.const 2
        i32.store offset=8
        local.get 0
        local.get 1
        i32.store offset=12
        i32.const 1
        local.set 1
        br 1 (;@1;)
      end
      local.get 0
      i32.const -1
      i32.store offset=8
      local.get 0
      i32.load offset=16
      local.get 0
      call 43573
      i32.const 4367477
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360984
        call 2180
        i32.const 4367477
        i32.const 1
        i32.store8
      end
      i32.const 3360984
      i32.load
      i32.load offset=92
      i32.load
      local.tee 1
      if  ;; label = @2
        local.get 1
        i32.const 1
        local.get 0
        i32.load offset=20
        local.get 0
        call 43428
        drop
      end
      local.get 0
      i32.load offset=16
      local.get 0
      call 43574
      i32.const 0
      local.set 1
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 1)
